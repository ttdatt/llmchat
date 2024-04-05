import {
  Button,
  TextInput,
  Modal,
  Text,
  Divider,
  Combobox,
  useCombobox,
  InputBase,
  Input,
  Group,
  CheckIcon,
} from '@mantine/core';
import { useState } from 'react';
import { LlmModel, models } from '@/types/LlmTypes';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  deleteAllThreadsAtom,
  modalVisibleAtom,
  modelAtom,
  unwrappedLlmTokenAtom,
} from '@/atom/atoms';

const ModelCombobox = () => {
  const [selectedModel, selectModel] = useAtom(modelAtom);

  const combobox = useCombobox({
    onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
  });

  const [value, setValue] = useState<LlmModel | undefined>(selectedModel);

  const options = models.map((item) => {
    const isActive = item.id === selectedModel.id;

    return (
      <Combobox.Option value={item.id} key={item.id} active={isActive}>
        <Group gap='xs'>
          {isActive && <CheckIcon size={12} />}
          <span>{item.name}</span>
        </Group>
      </Combobox.Option>
    );
  });

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={(val) => {
        const m = models.find((x) => x.id === val);
        setValue(m);
        if (m) selectModel(m);
        combobox.updateSelectedOptionIndex('active');
        combobox.closeDropdown();
      }}>
      <Combobox.Target>
        <InputBase
          className='flex-1'
          component='button'
          type='button'
          pointer
          rightSection={<Combobox.Chevron />}
          rightSectionPointerEvents='none'
          onClick={() => combobox.toggleDropdown()}>
          {value?.name || <Input.Placeholder>Pick value</Input.Placeholder>}
        </InputBase>
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options>{options}</Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
};

export const Settings = () => {
  const [opened, toggle] = useAtom(modalVisibleAtom);
  const deleteAllChat = useSetAtom(deleteAllThreadsAtom);
  const selectedModel = useAtomValue(modelAtom);

  const [llmToken, setLlmToken] = useAtom(unwrappedLlmTokenAtom);
  const [text, setText] = useState(llmToken);

  return (
    <Modal opened={opened} onClose={() => toggle(false)} title='Settings'>
      <div className='flex flex-row gap-2 items-center justify-between'>
        <Text>Current LLM token:</Text>
        <TextInput
          key={selectedModel.type}
          autoCapitalize='off'
          autoCorrect='off'
          defaultValue={llmToken}
          placeholder='Enter your token'
          onChange={(event) => {
            setText(event.target.value);
          }}
        />
      </div>
      <Divider className='my-3 mx-0' />
      <div className='flex flex-row gap-2 items-center justify-between'>
        <Text className='flex-1'>Models</Text>
        <ModelCombobox />
      </div>
      <Divider className='my-3 mx-0' />
      <div className='flex flex-row gap-2 items-center justify-between'>
        <Text>Delete all chats</Text>
        <Button
          color='red'
          onClick={async () => {
            deleteAllChat();
          }}>
          Delete all
        </Button>
      </div>
      <div className='flex justify-end mt-5'>
        <Button
          onClick={async () => {
            if (text) setLlmToken({ model: selectedModel, token: text });
            toggle(false);
          }}>
          Save
        </Button>
      </div>
    </Modal>
  );
};
