import React from 'react'
import './Login.css'
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonGrid,
  IonInput,
  IonItem,
  IonList,
  IonRow,
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
    <>
      <IonGrid fixed={true}>
        <IonRow class="ion-align-items-center ion-justify-content-center">
          <IonCol sizeXs="12" sizeLg="7" sizeXl="7">
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
          </IonCol>
        </IonRow>
      </IonGrid>
    </>
  )
}
export default Login
