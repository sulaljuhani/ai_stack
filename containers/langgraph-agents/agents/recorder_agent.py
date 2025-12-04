"""
Recorder Agent

Records life events, health data, and other miscellaneous information.
"""

from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

from agents.agent_registry import get_agent_config, get_agent_tools, get_agent_prompt_file
from utils.llm import get_agent_llm

# Load config and prompt
config = get_agent_config("recorder_agent")
prompt_file = get_agent_prompt_file("recorder_agent")

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", open(prompt_file).read()),
        MessagesPlaceholder("messages"),
    ]
)

# Use configured LLM/provider
llm = get_agent_llm(temperature=0)
recorder_agent_node = prompt | llm.bind_tools(tools=get_agent_tools("recorder_agent"))
