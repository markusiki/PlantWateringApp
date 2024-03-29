import React from 'react'
import './Login.css'
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
  IonPage,
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
    <IonPage>
      <IonCard className="login">
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
          <IonButton onClick={(event) => handleLogin(event)}>Login</IonButton>
        </IonCardContent>
      </IonCard>
    </IonPage>
  )
}
export default Login
