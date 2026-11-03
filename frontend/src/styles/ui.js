export const focusRing =
  "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-clinic-500/30 focus-visible:ring-offset-2";

const buttonBase = `inline-flex cursor-pointer items-center justify-center rounded-lg px-4 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-55 ${focusRing}`;

export const primaryButton = `${buttonBase} bg-clinic-600 text-white shadow-lg shadow-clinic-600/15 hover:-translate-y-0.5 hover:bg-clinic-700`;
export const quietButton = `${buttonBase} bg-clinic-50 text-clinic-800 hover:bg-clinic-100`;
export const dangerButton = `${buttonBase} bg-red-700 text-white hover:bg-red-800`;
export const textButton = `inline-flex cursor-pointer rounded-md border-0 bg-transparent px-2 py-1.5 text-sm font-bold text-clinic-700 hover:underline disabled:cursor-wait disabled:opacity-60 ${focusRing}`;

export const eyebrow =
  "mb-2 text-xs font-extrabold tracking-[0.12em] text-clinic-600 uppercase";
export const pageHeader =
  "mb-8 flex flex-col items-start justify-between gap-5 sm:flex-row sm:gap-8";
export const pageTitle =
  "mb-2 text-3xl font-extrabold tracking-tight text-ink sm:text-5xl";
export const pageDescription = "max-w-2xl text-muted";

export const card =
  "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm";
export const tableWrap = "overflow-x-auto";
export const table =
  "w-full min-w-3xl border-collapse text-left [&_tbody_tr:hover]:bg-slate-50/70 [&_tbody_tr:last-child_td]:border-b-0 [&_td]:border-b [&_td]:border-slate-100 [&_td]:px-5 [&_td]:py-4 [&_td]:text-sm [&_td]:text-slate-700 [&_th]:border-b [&_th]:border-slate-200 [&_th]:bg-slate-50 [&_th]:px-5 [&_th]:py-3 [&_th]:text-xs [&_th]:font-bold [&_th]:tracking-wider [&_th]:text-muted [&_th]:uppercase";
export const tableHead =
  "border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-bold tracking-wider text-muted uppercase";
export const tableCell =
  "border-b border-slate-100 px-5 py-4 text-sm text-slate-700 last:border-b-0";
export const tableState =
  "grid min-h-72 place-content-center justify-items-center px-6 py-10 text-center text-muted";
export const spinner =
  "mb-3 size-9 animate-spin rounded-full border-3 border-clinic-100 border-t-clinic-600";
export const emptyMark =
  "grid size-14 place-items-center rounded-2xl bg-clinic-50 font-extrabold text-clinic-800";

export const modalBackdrop =
  "fixed inset-0 z-50 grid overflow-y-auto bg-slate-950/55 p-4 backdrop-blur-sm sm:p-6";
export const modalCard =
  "m-auto max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:max-h-[calc(100vh-3rem)] sm:p-8";
export const modalHeader =
  "mb-6 flex items-start justify-between gap-4";
export const modalClose = `grid size-9 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-slate-100 text-2xl leading-none text-muted hover:bg-slate-200 ${focusRing}`;

export const formGrid = "grid grid-cols-1 gap-4 sm:grid-cols-2";
export const formField = "grid gap-2 text-sm font-bold text-ink";
export const formControl = `w-full rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-3 text-sm font-normal text-ink placeholder:text-slate-400 hover:border-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 ${focusRing}`;
export const formActions =
  "mt-6 grid grid-cols-2 justify-end gap-3 sm:flex";

export const searchControl = `${formControl} bg-white pl-11`;
export const rolePill =
  "inline-flex w-fit items-center rounded-full bg-clinic-100 px-3 py-1.5 text-xs font-bold text-clinic-800 capitalize";
