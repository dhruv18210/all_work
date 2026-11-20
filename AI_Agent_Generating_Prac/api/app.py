from fastapi import FastAPI
from langchain_core.prompts import ChatPromptTemplate
from langchain_community.llms import Ollama
from langserve import add_routes
from dotenv import load_dotenv
import uvicorn
import os

load_dotenv()
os.environ["LANGCHAIN_API_KEY"] = os.getenv("LANGCHAIN_API_KEY")

app = FastAPI(
    title="LangChain Server",
    version="1.0",
    decsription = "A simple API for LangChain Server",

)

llm = Ollama(model="llama2")

prompt1 = ChatPromptTemplate.from_template("write me an essay about {topic} with 100 words")
prompt2 = ChatPromptTemplate.from_template("write me an poem about {topic} for 5 year child with 200 words")

add_routes(
    app,
    prompt1|llm,
    path="/essay",
)

add_routes(
    app,
    prompt2|llm,
    path="/poem",
)

if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)