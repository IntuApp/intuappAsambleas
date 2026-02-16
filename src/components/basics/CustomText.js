"use client";
import React from "react";
import PropTypes from "prop-types";

const textStyles = {
  Title: "text-[57px] leading-[72px] font-bold",
  TitleX: "text-[40px] leading-[48px] font-bold",
  TitleL: "text-[32px] leading-[40px] font-bold",
  TitleM: "text-[24px] leading-[32px] font-bold",
  SubTitle: "text-[24px] leading-[32px] font-bold",

  bodyX: "text-[22px] leading-[32px]",
  bodyL: "text-[18px] leading-[24px] ",
  bodyM: "text-[16px] leading-[24px]",
  bodyS: "text-[14px] leading-[16px]",

  labelL: "text-[16px] leading-[24px] ",
  labelM: "text-[14px] leading-[16px] ",
  labelS: "text-[12px] leading-[16px] ",

  captionL: "text-[12px] leading-[12px]",
  captionS: "text-[9px] leading-[12px]",
};

export default function CustomText({
  variant = "",
  as = "p",
  className = "",
  children,
}) {
  const Component = as;

  return (
    <Component className={`${textStyles[variant]} ${className}`}>
      {children}
    </Component>
  );
}

CustomText.propTypes = {
  variant: PropTypes.oneOf([
    "Title",
    "TitleL",
    "SubTitle",
    "bodyL",
    "bodyM",
    "bodyS",
    "bodyX",
    "labelL",
    "labelM",
    "labelS",
    "captionL",
    "captionS",
  ]),
  as: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};
