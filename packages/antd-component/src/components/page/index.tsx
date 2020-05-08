import React from 'react';

export default function Page(props: any) {
  const { children, content } = props;
  return (
    <div>
      <div>
        {content}
        {children}
      </div>
    </div>
  );
}
