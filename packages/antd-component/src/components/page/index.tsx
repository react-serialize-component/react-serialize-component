import React from 'react';

export default function Page(props: any) {
  const { title, content } = props;
  return (
    <div>
      <p>title: {title}</p>
      <div>{content}</div>
    </div>
  );
}
