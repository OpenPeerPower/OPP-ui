import { css } from "lit-element";

export const configFlowContentStyles = css`
  h2 {
    margin-top: 24px;
    padding: 0 24px;
  }

  .content {
    margin-top: 20px;
    padding: 0 24px;
  }

  .buttons {
    position: relative;
    padding: 8px 8px 8px 24px;
    margin: 0;
    color: var(--primary-color);
    display: flex;
    justify-content: flex-end;
  }

  op-markdown {
    overflow-wrap: break-word;
  }
  op-markdown a {
    color: var(--primary-color);
  }
  op-markdown img:first-child:last-child {
    display: block;
    margin: 0 auto;
  }
`;
