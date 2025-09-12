import AuthForms from '../AuthForms'

export default function AuthFormsExample() {
  return (
    <AuthForms 
      onLogin={(username, password) => console.log('Login:', { username, password })}
      onRegister={(userData) => console.log('Register:', userData)}
      onBack={() => console.log('Back to home')}
    />
  )
}