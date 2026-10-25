// Documents a person holds without ticking them separately.

/** A California ID from the last five years also means the DMV has a record of you. */
export const withImplied = (have: string[]) =>
  have.includes("old_ca_id_5yr") && !have.includes("dmv_record") ? [...have, "dmv_record"] : have;
