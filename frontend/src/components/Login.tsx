import React from 'react'
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonInput,
  IonItem,
  IonList,
} from '@ionic/react'
import { ILoginProps } from '../interfaces'

const Login: React.FC<ILoginProps> = ({
  username,
  setUsername,
  password,
  setPassword,
  handleLogin,
}) => {
  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>Login</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <IonList>
          <IonItem>
            <IonInput
              label="Username"
              name="username"
              value={username}
              type="text"
              maxlength={40}
              onInput={(event) => setUsername((event.target as HTMLInputElement).value)}
            ></IonInput>
          </IonItem>
          <IonItem>
            <IonInput
              label="Password"
              name="password"
              value={password}
              type="password"
              maxlength={50}
              onInput={(event) => setPassword((event.target as HTMLInputElement).value)}
            ></IonInput>
          </IonItem>
        </IonList>
        <IonButtons slot="secondary">
          <IonButton onClick={(event) => handleLogin(event)}>Login</IonButton>
        </IonButtons>
      </IonCardContent>
    </IonCard>
  )
}
export default Login
