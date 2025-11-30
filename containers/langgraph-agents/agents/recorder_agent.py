"""
Recorder Agent

Records life events, health data, and other miscellaneous information.
"""

from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

from.agent_registry import get_agent_config, get_agent_tools, get_agent_prompt_file

# Create the recorder agent
config = get_agent_config("recorder_agent")
prompt_file = get_agent_prompt_file("recorder_agent")

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", open(prompt_file).read()),
        ("user", "{input}"),
    ]
)

llm = ChatOpenAI(temperature=0, model_name="gpt-4-turbo-preview")
recorder_agent_node = prompt | llm.bind_tools(tools=get_agent_tools("recorder_agent"))