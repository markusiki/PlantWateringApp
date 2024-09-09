import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonText,
  IonTitle,
  IonButton,
} from '@ionic/react'
import { IHeaderProps } from '../interfaces'

const Header: React.FC<IHeaderProps> = ({ isBackendConnected, refresh }) => {
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
