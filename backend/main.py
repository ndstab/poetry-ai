from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

class PoemRequest(BaseModel):
    theme: str
    length: str
    rhyme_scheme: str
    poet_style: str

class AIPoetryGenerator:
    def __init__(self):
        self.gemini_client = self._init_gemini_client()
    
    def _init_gemini_client(self):
        gemini_key = os.getenv('GEMINI_API_KEY')
        if gemini_key:
            genai.configure(api_key=gemini_key)
            return genai.GenerativeModel('gemini-pro')
        return None
    
    def generate_poem(self, request: PoemRequest):
        # Use Gemini as the primary AI service
        if self.gemini_client:
            try:
                return self._generate_poem_gemini(request)
            except Exception as e:
                print(f"Gemini generation failed: {e}")
                raise HTTPException(status_code=500, detail=f"Gemini generation error: {str(e)}")
        
        # Raise exception if no AI service is available
        raise HTTPException(status_code=500, detail="No AI service available")
    
    def _generate_poem_gemini(self, request: PoemRequest):
        generation_config = genai.types.GenerationConfig(
            # Adjust these parameters to help avoid safety filters
            temperature=0.7,
            top_p=0.9,
            max_output_tokens=300
        )

        safety_settings = {
            'HARM_CATEGORY_SEXUALLY_EXPLICIT': 'BLOCK_NONE',
            'HARM_CATEGORY_HATE_SPEECH': 'BLOCK_NONE',
            'HARM_CATEGORY_HARASSMENT': 'BLOCK_NONE',
            'HARM_CATEGORY_DANGEROUS_CONTENT': 'BLOCK_NONE'
        }

        prompt = f"""
YOU ARE A MASTERFUL POEM GENERATOR, HIGHLY SKILLED IN CREATING POETRY THAT PRECISELY ADHERES TO GIVEN THEMES, STYLES, AND FORMATS. YOUR TASK IS TO CRAFT A UNIQUE, ENGAGING, AND WELL-STRUCTURED POEM BASED ON THE FOLLOWING SPECIFICATIONS:

### INSTRUCTIONS:
1. THE POEM MUST STRICTLY FOLLOW THE THEME: {request.theme}.
2. IT MUST CONTAIN EXACTLY {request.length} PARAGRAPHS — NO MORE, NO LESS.
3. ADHERE TO THE RHYMING SCHEME: {request.rhyme_scheme}, ENSURING ACCURACY AND CONSISTENCY IN THE RHYME PATTERN.
4. EMBODY THE STYLE AND AESTHETIC OF THE POET: {request.poet_style}, INCORPORATING DISTINCTIVE ELEMENTS OF THEIR TONE, LANGUAGE, AND IMAGERY.
5. GIVE A FITTING TITLE TO THE POEM.
### CHAIN OF THOUGHTS:
- ANALYZE the theme ({request.theme}) and IDENTIFY the core emotions, imagery, or ideas typically associated with it.
- UNDERSTAND the {request.poet_style} style, including their use of tone, diction, and figurative language, to authentically reflect their poetic voice.
- STRUCTURE the poem to meet the exact line/paragraph count ({request.length}) and FOLLOW the given rhyme scheme ({request.rhyme_scheme}) without deviation.
- ENSURE the poem is COHERENT, CREATIVE, and ENGAGING while honoring the given constraints.

### WHAT NOT TO DO:
- DO NOT EXCEED OR REDUCE THE SPECIFIED LINE/PARAGRAPH/STANZA COUNT ({request.length}).
- DO NOT DEVIATE FROM THE RHYMING SCHEME ({request.rhyme_scheme}) — ENSURE IT MATCHES EXACTLY.
- AVOID GENERATING A POEM THAT DOES NOT EMBODY THE REQUESTED POETIC STYLE ({request.poet_style}).
- DO NOT STRAY FROM THE THEME ({request.theme}) OR INCLUDE UNRELATED IDEAS.
- DO NOT PRODUCE LOW-QUALITY OR GENERIC POETRY; MAINTAIN HIGH STANDARDS OF CREATIVITY AND EXPERTISE.

### OUTPUT:
GENERATE A WELL-CRAFTED POEM THAT STRICTLY ADHERES TO THE ABOVE CONDITIONS WHILE DEMONSTRATING ORIGINALITY AND LINGUISTIC BEAUTY.
"""

        
        try:
            response = self.gemini_client.generate_content(
                prompt, 
                generation_config=generation_config,
                safety_settings=safety_settings
            )

            # Check if the response contains text
            if response and response.text:
                return response.text.strip()
            
            # If no text, check for candidates and extract first candidate
            if response.candidates:
                first_candidate = response.candidates[0]
                if first_candidate.text:
                    return first_candidate.text.strip()
            
            # If still no text, raise an exception
            raise ValueError("No valid poem generated")

        except Exception as e:
            print(f"Detailed Gemini error: {e}")
            raise HTTPException(status_code=500, detail=f"Poem generation failed: {str(e)}")

app = FastAPI()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

poetry_generator = AIPoetryGenerator()

@app.post("/generate-poem")
async def generate_poem(request: PoemRequest):
    try:
        poem = poetry_generator.generate_poem(request)
        return {"poem": poem}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)