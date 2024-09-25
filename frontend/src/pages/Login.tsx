import React from 'react'
import './Login.css'
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCol, IonContent, IonGrid, IonInput, IonItem, IonList, IonPage, IonRow } from '@ionic/react'
import { ILoginProps } from '../interfaces'

const Login: React.FC<ILoginProps> = ({ username, setUsername, password, setPassword, handleLogin }) => {
  return (
    <IonPage>
      <IonContent>
        <IonGrid fixed={true} style={{ height: '100vh' }}>
          <IonRow className="ion-justify-content-center ion-align-items-end" style={{ height: '40%' }}>
            <IonCol sizeXs="6" sizeSm="5" sizeMd="4" sizeLg="3" sizeXl="3">
              <img className="logo" alt="Plant Watering App Logo" src="logo.jpeg" />
            </IonCol>
          </IonRow>
          <IonRow className="ion-justify-content-center ion-align-items-center" style={{ height: '5%' }}>
            <IonCol>
              <h1 className="appName">Plant Watering App</h1>
            </IonCol>
          </IonRow>
          <IonRow className="ion-justify-content-center ion-align-items-start" style={{ height: '55%' }}>
            <IonCol sizeXs="11" sizeMd="8" sizeLg="7" sizeXl="6">
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
      </IonContent>
    </IonPage>
  )
}
export default Login
