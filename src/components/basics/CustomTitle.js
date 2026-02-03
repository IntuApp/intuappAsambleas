'use client';
import React from 'react';
import PropTypes from 'prop-types';

const titleStyles = {
  h1: `
    font-bold
    text-[53px] leading-[72px]
    md:text-[53px] md:leading-[72px]
    lg:text-[53px] lg:leading-[72px]
  `,
  h2: `
    font-bold
    text-[34px] leading-[34px]
    md:text-[40px] md:leading-[40px]
    lg:text-[40px] lg:leading-[48px]
  `,
  h3: `
    font-bold
    text-[27px] leading-[32px]
    md:text-[53px] md:leading-[64px]
    lg:text-[57px] lg:leading-[72px]
  `,
  h4: `
    text-[22px] leading-[32px]
    lg:text-[24px] lg:leading-[32px]
  `,
  h5: `
    font-medium
    text-[18px] leading-[24px]
    lg:text-[20px] lg:leading-[32px]
  `,
  h6: `
    font-normal
    text-[16px] leading-[24px]
  `,
};

export default function CustomTitle({
  as = 'h2',
  className = '',
  children,
}) {
  const Component = as;

  return (
    <Component className={`${titleStyles[as]} ${className}`}>
      {children}
    </Component>
  );
}

CustomTitle.propTypes = {
  as: PropTypes.oneOf(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']),
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};
