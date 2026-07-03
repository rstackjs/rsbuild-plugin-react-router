
import { serverOnly1, serverOnly2 } from "../utils.server";

export const loader = () => {
  return { serverOnly1 }
}

export const action = () => {
  console.log(serverOnly2)
  return null
}
              