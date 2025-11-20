declare module 'react-google-recaptcha' {
  import { Component } from 'react'

  export interface ReCAPTCHAProps {
    sitekey: string
    onChange?: (token: string | null) => void
    theme?: 'light' | 'dark'
    size?: 'normal' | 'compact' | 'invisible'
    tabindex?: number
    hl?: string
    ref?: React.RefObject<ReCAPTCHA>
  }

  export default class ReCAPTCHA extends Component<ReCAPTCHAProps> {
    getValue(): string | null
    reset(): void
    execute(): void
  }
}

