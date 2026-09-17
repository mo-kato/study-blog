<script lang="ts">
import { css } from "../../styled-system/css";
import { flex } from "../../styled-system/patterns";

const details = flex({
  position: "relative",
  h: 8,
  w: 8,
  borderRadius: "full",
  justifyContent: "center",
  bgColor: "marineLime.800",
  color: "marineLime.50",
  _light: {
    bgColor: "cyan.100",
    color: "cyan.800",
  },
  _open: {
    borderRadius: "50% 50% 0 0",
  },
});

const field = flex({
  w: 8,
  direction: "column",
  position: "absolute",
  top: "100%",
  left: 0,
});

const radio = flex({
  justifyContent: "center",
  h: 8,
  w: 8,
  cursor: "pointer",
  "& > input": {
    appearance: "none",
  },
  _last: {
    borderRadius: "0 0 50% 50%",
  },
  bgColor: "marineLime.800",
  color: "marineLime.50",
  _light: {
    bgColor: "cyan.100",
    color: "cyan.800",
  },
});

const icon = css({
  h: 4,
  w: 4,
});

let mode = $state(localStorage.getItem("theme") ?? "system");
let isOpen = $state(false);

const handleOnChange = (
  event: Event & { currentTarget: EventTarget & HTMLInputElement },
) => {
  document.documentElement.setAttribute(
    "data-color-mode",
    event.currentTarget.value,
  );
  localStorage.setItem("theme", event.currentTarget.value);
  isOpen = false;
};
</script>

{#snippet darkIcon()}
  <svg class={icon} xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
    <title>dark mode</title>
    <path
      fill="currentColor"
      d="M480-120q-150 0-255-105T120-480q0-150 105-255t255-105q14 0 27.5 1t26.5 3q-41 29-65.5 75.5T444-660q0 90 63 153t153 63q55 0 101-24.5t75-65.5q2 13 3 26.5t1 27.5q0 150-105 255T480-120Zm0-80q88 0 158-48.5T740-375q-20 5-40 8t-40 3q-123 0-209.5-86.5T364-660q0-20 3-40t8-40q-78 32-126.5 102T200-480q0 116 82 198t198 82Zm-10-270Z"
    />
  </svg>
{/snippet}

{#snippet lightIcon()}
  <svg class={icon} xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
    <title>light mode</title>
    <path
      fill="currentColor"
      d="M565-395q35-35 35-85t-35-85q-35-35-85-35t-85 35q-35 35-35 85t35 85q35 35 85 35t85-35Zm-226.5 56.5Q280-397 280-480t58.5-141.5Q397-680 480-680t141.5 58.5Q680-563 680-480t-58.5 141.5Q563-280 480-280t-141.5-58.5ZM200-440H40v-80h160v80Zm720 0H760v-80h160v80ZM440-760v-160h80v160h-80Zm0 720v-160h80v160h-80ZM256-650l-101-97 57-59 96 100-52 56Zm492 496-97-101 53-55 101 97-57 59Zm-98-550 97-101 59 57-100 96-56-52ZM154-212l101-97 55 53-97 101-59-57Zm326-268Z"
    />
  </svg>
{/snippet}

{#snippet systemIcon()}
  <svg class={icon} xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
    <title>system mode</title>
    <path
      fill="currentColor"
      d="M240-120v-80l40-40H160q-33 0-56.5-23.5T80-320v-440q0-33 23.5-56.5T160-840h640q33 0 56.5 23.5T880-760v440q0 33-23.5 56.5T800-240H680l40 40v80H240Zm-80-200h640v-440H160v440Zm0 0v-440 440Z"
    />
  </svg>
{/snippet}

<details class={details} bind:open={isOpen}>
  <summary aria-label="テーマ切替">
    {#if mode === "dark"}
      {@render darkIcon()}
    {:else if mode === "light"}
      {@render lightIcon()}
    {:else}
      {@render systemIcon()}
    {/if}
  </summary>
  <fieldset class={field}>
    {#if mode !== "light"}
      <label class={radio}>
        {@render lightIcon()}
        <input
          type="radio"
          name="theme"
          value="light"
          bind:group={mode}
          onchange={handleOnChange}
          aria-label="light"
        >
      </label>
    {/if}
    {#if mode !== "dark"}
      <label class={radio}>
        {@render darkIcon()}
        <input
          type="radio"
          name="theme"
          value="dark"
          bind:group={mode}
          onchange={handleOnChange}
          aria-label="dark"
        >
      </label>
    {/if}
    {#if mode !== "system"}
      <label class={radio}>
        {@render systemIcon()}
        <input
          type="radio"
          name="theme"
          value="system"
          bind:group={mode}
          onchange={handleOnChange}
          aria-label="system"
        >
      </label>
    {/if}
  </fieldset>
</details>
