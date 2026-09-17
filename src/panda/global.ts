const globalCss = {
  html: {
    fontFamily: "sans",
    color: "text",
    bgColor: "background.canvas",
  },
  button: {
    cursor: "pointer",
    _disabled: {
      cursor: "default",
    },
  },
  summary: {
    cursor: "pointer",
    display: "block",
    "&::-webkit-details-marker": {
      display: "none",
    },
  },
  select: {
    cursor: "pointer",
    _disabled: {
      cursor: "default",
    },
  },
};

export default globalCss;
