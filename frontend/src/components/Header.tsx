import { IonHeader, IonToolbar, IonButtons, IonMenuButton, IonText, IonTitle, IonButton, IonItem } from '@ionic/react'
import { IHeaderProps } from '../interfaces'

const Header: React.FC<IHeaderProps> = ({ isBackendConnected, refresh, deviceSettings }) => {
  const waterTankLevel = Math.round((deviceSettings.waterAmount / deviceSettings.tankVolume) * 100)
  return (
    <IonHeader>
      <IonToolbar>
        <IonButtons slot="start">
          <IonMenuButton></IonMenuButton>
        </IonButtons>
        <IonText>Status: </IonText>
        {isBackendConnected ? (
          <IonText color={'success'}>Connected</IonText>
        ) : (
          <IonText color={'danger'}>Disconnected</IonText>
        )}
        <IonText style={{ marginLeft: '2em' }}>
          <IonText>Water tank level: </IonText>
          {waterTankLevel < 20 ? (
            <IonText color={'danger'}>{waterTankLevel}%</IonText>
          ) : (
            <IonText color={'success'}>{waterTankLevel}%</IonText>
          )}
        </IonText>

        <IonTitle slot="secondary">My plants</IonTitle>

        <IonButtons slot="end">
          <IonButton color={'primary'} onClick={refresh}>
            REFRESH
          </IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>
  )
}

export default Header
