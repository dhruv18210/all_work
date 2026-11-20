import streamlit as st
import os
from langchain_groq import ChatGroq
from langchain_ollama import OllamaEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from langchain_classic.chains import create_retrieval_chain
from langchain_community.vectorstores import FAISS
from langchain_community.document_loaders import PyPDFDirectoryLoader
from dotenv import load_dotenv
import time
load_dotenv()

groq_api_key = os.getenv("GROQ_API_KEY")

st.title("CHAT GROQ DEMO USING LLAMA3")

LLM=ChatGroq(groq_api_key=groq_api_key,model="openai/gpt-oss-20b")

prompt=ChatPromptTemplate.from_template(
    """
    Answer the questions based on the provided context only.
    Please provide the most accurate response based on the question
    <context>
    {context}
    </context>
    Question:{input}
    """
)
embeddings=OllamaEmbeddings(model="nomic-embed-text")

def vector_embedding():
    if "vectors" not in st.session_state:
        st.session_state.embeddings = embeddings
        st.session_state.loader=PyPDFDirectoryLoader("AI_Agent_Generating_Prac/groq/us_census")  # Data Ingestion
        st.session_state.docs=st.session_state.loader.load()     # Document Loading
        st.session_state.text_splitter=RecursiveCharacterTextSplitter(chunk_size=1000,chunk_overlap=200)   # Chunk creation
        st.session_state.final_documents=st.session_state.text_splitter.split_documents(st.session_state.docs[:50   ])    # Splitting document
        st.session_state.vectors = FAISS.from_documents(st.session_state.final_documents,st.session_state.embeddings)    # Vector store using OllamaEmbedding


prompt1=st.text_input("enter your question from docs")

if st.button("Document Embedding"):
    vector_embedding()
    st.write("Vector Store DB is Ready")


if prompt1:
    document_chain=create_stuff_documents_chain(LLM,prompt)
    retriever=st.session_state.vectors.as_retriever()
    retriever_chain=create_retrieval_chain(retriever,document_chain)
    start=time.process_time()
    response=retriever_chain.invoke({'input':prompt1})
    print("Response time :",time.process_time()-start)
    st.write(response['answer'])

    # with a streamlit expander
    with st.expander("Document Similarity Search:"):
        # Find the relevant chunks
        for i,doc in enumerate(response['context']):
            st.write(doc.page_content)
            st.write("---------------------------------------")