// TODO: Delete this file

declare module '*.json' {
  const value: any
  export default value
}

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
