import Markdown from 'react-markdown';
import fileText from '../assets/testMsg.txt';
import { useEffect, useState } from 'react';
import rehypeHighlight from 'rehype-highlight';

export const TestMarkdown = () => {
  const [content, setContent] = useState<string>('');

  useEffect(() => {
    fetch(fileText)
      .then(r => r.text())
      .then(text => {
        setContent(text);
      });
  }, []);

  return <Markdown rehypePlugins={[rehypeHighlight]}>{content}</Markdown>;
};
