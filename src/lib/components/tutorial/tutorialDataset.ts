/**
 * Sample dataset that every tutorial sequence runs against.
 *
 * The backend (or Mockoon in development) must serve this file via the
 * `file` query parameter of the oncology endpoint. Swap the dataset here
 * rather than in the individual tutorial step files.
 */
export const TUTORIAL_DATASET_FILE = "tutorial.json";

export const TUTORIAL_PREREQUISITE_URL = `/module/oncology?file=${TUTORIAL_DATASET_FILE}`;
