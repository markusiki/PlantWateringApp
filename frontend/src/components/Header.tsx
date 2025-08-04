import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonText,
  IonTitle,
  IonButton,
  IonItem,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/react'
import { IHeaderProps } from '../interfaces'
import './Header.css'

const Header: React.FC<IHeaderProps> = ({ isBackendConnected, refresh, deviceSettings }) => {
  const waterTankLevel =
    deviceSettings.tankVolume > 0 ? Math.round((deviceSettings.waterAmount / deviceSettings.tankVolume) * 100) : 0

  return (
    <IonHeader>
      <IonToolbar>
        <IonGrid>
          <IonRow className="ion-align-items-center">
            <IonCol size="2" className="button">
              <IonButtons>
                <IonMenuButton></IonMenuButton>
              </IonButtons>
            </IonCol>
            <IonCol size="8">
              <IonCol className="contentCenter ion-justify-content-between">
                <IonTitle>PlantWateringApp</IonTitle>
              </IonCol>

              <IonRow className="ion-justify-content-between">
                <IonCol size="12" sizeSm="12" sizeMd="4">
                  <IonText>Status: </IonText>
                  {isBackendConnected ? (
                    <IonText color={'success'}>Connected</IonText>
                  ) : (
                    <IonText color={'danger'}>Disconnected</IonText>
                  )}
                </IonCol>
                <IonCol size="12" sizeSm="12" sizeMd="4">
                  <IonText>Time program: </IonText>
                  {deviceSettings.runTimeProgram ? (
                    <IonText color={'success'}>Enabled</IonText>
                  ) : (
                    <IonText color={'warning'}>Disabled</IonText>
                  )}
                </IonCol>
                <IonCol size="12" sizeSm="12" sizeMd="auto">
                  <IonText>Water tank level: </IonText>
                  {waterTankLevel < 20 ? (
                    <IonText color={'danger'}>{waterTankLevel}%</IonText>
                  ) : (
                    <IonText color={'success'}>{waterTankLevel}%</IonText>
                  )}
                </IonCol>
              </IonRow>
            </IonCol>
            <IonCol size="2" className="contentEnd">
              <IonButtons>
                <IonButton color={'primary'} onClick={refresh}>
                  REFRESH
                </IonButton>
              </IonButtons>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonToolbar>
    </IonHeader>
  )
}

export default Header
