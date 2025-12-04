"""
Analyst Agent

Analyzes data, runs reports, and answers complex questions about logged history.
"""

from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

from agents.agent_registry import get_agent_prompt_file, get_agent_tools
from utils.llm import get_agent_llm

prompt_file = get_agent_prompt_file("analyst_agent")

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", open(prompt_file).read()),
        MessagesPlaceholder("messages"),
    ]
)

llm = get_agent_llm(temperature=0)
analyst_agent_node = prompt | llm.bind_tools(tools=get_agent_tools("analyst_agent"))
