import { removeFileAtom } from '@/atom/derivedAtoms';
import { CustomFileWithPath } from '@/types/Message';
import { IconFile, IconCircleXFilled } from '@tabler/icons-react';
import { useSetAtom } from 'jotai';

export const FileItem = ({ file }: { file: CustomFileWithPath }) => {
	const removeFile = useSetAtom(removeFileAtom);

	return (
		<div className='relative p-2 gap-3 flex flex-row items-center rounded-xl bg-gray-300 min-w-32'>
			<IconCircleXFilled
				onClick={() => removeFile(file)}
				size={24}
				className='absolute -top-2 -right-2 cursor-pointer'
			/>
			<div className='flex bg-pink-300 justify-center items-center rounded-xl p-2'>
				<IconFile size='32' stroke={1.5} />
			</div>
			<div className='flex flex-col'>
				<p>{file.file.name}</p>
				<p>File</p>
			</div>
		</div>
	);
};
