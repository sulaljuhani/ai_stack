"""
Analyst Agent

Analyzes data, runs reports, and answers complex questions about logged history.
"""

from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

from.agent_registry import get_agent_config, get_agent_tools, get_agent_prompt_file

# Create the analyst agent
config = get_agent_config("analyst_agent")
prompt_file = get_agent_prompt_file("analyst_agent")

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", open(prompt_file).read()),
        ("user", "{input}"),
    ]
)

llm = ChatOpenAI(temperature=0, model_name="gpt-4-turbo-preview")
analyst_agent_node = prompt | llm.bind_tools(tools=get_agent_tools("analyst_agent"))