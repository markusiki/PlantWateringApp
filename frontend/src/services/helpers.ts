let user: string | null = null

const setUser = (loggedUser: string) => {
  user = loggedUser
}

const getAccessCookie = () => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; csrf_access_token=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift();
}

const getConfig = () => {
  return {
    headers: { 'X-CSRF-TOKEN': getAccessCookie(), 'X-USER': user }
  }
}

const serviceHelper = { getConfig, setUser }


export default serviceHelper