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
  Textarea,
} from '@mantine/core';
import { useEffect, useMemo, useState } from 'react';
import { LlmModel, models } from '@/types/LlmTypes';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  customInstructionsAtom,
  llmTokensAtom,
  modalVisibleAtom,
} from '@/atom/atoms';
import {
  deleteAllThreadsAtom,
  llmTokenAtom,
  modelAtom,
} from '@/atom/derivedAtoms';
import { decrypt } from '@/utils/crypto';
import { useMobile } from '@/hooks/useMobile';

const ModelCombobox = ({
  selectedModel,
  onChange,
}: { selectedModel: LlmModel; onChange: (m: LlmModel) => void }) => {
  const [model, selectModel] = useState(selectedModel);

  const combobox = useCombobox({
    onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
  });

  const options = useMemo(
    () =>
      models.map((item) => {
        const isActive = item.id === model.id;

        return (
          <Combobox.Option value={item.id} key={item.id} active={isActive}>
            <Group gap='xs'>
              {isActive && <CheckIcon size={12} />}
              <span>{item.name}</span>
            </Group>
          </Combobox.Option>
        );
      }),
    [model.id],
  );

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={(val) => {
        const index = models.findIndex((x) => x.id === val);
        if (index >= 0) {
          const m = models[index];
          selectModel(m);
          onChange(m);
          combobox.closeDropdown();
        }
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
          {model?.name || <Input.Placeholder>Pick value</Input.Placeholder>}
        </InputBase>
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options>{options}</Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
};

export const Settings = () => {
  const isMobile = useMobile();
  const [opened, toggle] = useAtom(modalVisibleAtom);
  const deleteAllChat = useSetAtom(deleteAllThreadsAtom);
  const [selectedModel, selectModel] = useAtom(modelAtom);
  const [llmToken, setLlmToken] = useAtom(llmTokenAtom);
  const llmTokens = useAtomValue(llmTokensAtom);
  const [instructions, setInstructions] = useAtom(customInstructionsAtom);

  const [token, setToken] = useState(llmToken);
  const [model, setModel] = useState(selectedModel);
  const [localInstructions, setLocalInstructions] = useState(instructions);

  useEffect(() => {
    setLocalInstructions(instructions);
  }, [instructions]);

  useEffect(() => {
    (async () => {
      const t = llmTokens[model.type];
      setToken(t ? await decrypt(t) : '');
    })();
  }, [model, llmTokens]);

  return (
    <Modal
      size='lg'
      opened={opened}
      onClose={() => {
        toggle(false);
        setToken(llmToken);
        setModel(selectedModel);
      }}
      title='Settings'>
      <div className='flex flex-row gap-2 items-center justify-between'>
        <Text className='w-1/3'>Current LLM token:</Text>
        <TextInput
          styles={{ input: { fontSize: isMobile ? '1rem' : '14px' } }}
          className='w-2/3'
          autoCapitalize='off'
          autoCorrect='off'
          value={token}
          placeholder='Enter your token'
          onChange={(event) => {
            setToken(event.target.value);
          }}
        />
      </div>
      <Divider className='my-3 mx-0' />
      <div className='flex flex-row gap-2 items-center justify-between'>
        <Text className='w-1/3'>Models</Text>
        <ModelCombobox
          selectedModel={selectedModel}
          onChange={(m) => setModel(m)}
        />
      </div>
      <Divider className='my-3 mx-0' />
      <div className='flex flex-row gap-2 items-center justify-between'>
        <Text className='w-1/3'>Custom instructions</Text>
        <Textarea
          styles={{ input: { fontSize: isMobile ? '1rem' : '14px' } }}
          className='w-2/3'
          autosize
          autoFocus
          autoComplete='off'
          autoCorrect='off'
          maxRows={6}
          value={localInstructions}
          onChange={(event) => {
            setLocalInstructions(event.currentTarget.value);
          }}
        />
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
            selectModel(model);
            setLlmToken({ model, token });
            setInstructions(localInstructions);
            toggle(false);
          }}>
          Save
        </Button>
      </div>
    </Modal>
  );
};
