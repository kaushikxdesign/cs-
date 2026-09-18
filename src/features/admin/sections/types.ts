export interface SectionProps {
  state: any;
  dispatch: (action: any) => void;
  /** Sub-screen the section has drilled into, carried in the URL. */
  focus?: string;
  onFocus: (id?: string) => void;
}
