import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonPage, IonProgressBar, IonRow, IonText, IonTitle, IonToolbar } from '@ionic/react';
import { settingsOutline } from 'ionicons/icons'
import './Home.css';
import { useState } from 'react';
import { IUnitState } from '../interfaces';


const Home: React.FC = () => {

  const [unit1, setUnit1] = useState<IUnitState>({ id: "Unit 1", name: "Plant name", status: "OK", moistLevel: 0.5, moistLimit: 15000, waterTime: 10, moistMeasureIntervall: 604800, log: ["12.12.2023 12:00"] })
  const [unit2, setUnit2] = useState<IUnitState>({ id: "Unit 2", name: "Plant name", status: "ERROR", moistLevel: 0.1, moistLimit: 15000, waterTime: 10, moistMeasureIntervall: 604800, log: ["12.12.2023 12:00"] })
  const [unit3, setUnit3] = useState<IUnitState>({ id: "Unit 3", name: "Plant name", status: "OK", moistLevel: 0.3, moistLimit: 15000, waterTime: 10, moistMeasureIntervall: 604800, log: ["12.12.2023 12:00"] })
  const [unit4, setUnit4] = useState<IUnitState>({ id: "Unit 4", name: "Plant name", status: "OK", moistLevel: 0.9, moistLimit: 15000, waterTime: 10, moistMeasureIntervall: 604800, log: ["12.12.2023 12:00"] })
  const units = [unit1, unit2, unit3, unit4]

  const setColor = (unit: IUnitState) => {
    if (unit.moistLevel < 0.33) {
      return 'danger'
    }
    if (unit.moistLevel >= 0.33 && unit.moistLevel < 0.66) {
      return 'success'
    }
    else {
      return 'primary'
    }
  }
  
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle slot='secondary'>My plants</IonTitle>
          <IonButtons slot='end'>
            <IonButton color={"primary"}>REFRESH</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {units.map(unit => 
          <IonCard>
            <IonGrid>
              <IonRow>
                <IonCol size='2'><p>{unit.id}</p></IonCol>
                <IonCol size='8'><h2 className='align-center'>{unit.name}</h2></IonCol>
                <IonCol size='2'>
                  <IonButtons>
                    <IonButton>
                      <IonIcon icon={settingsOutline}></IonIcon>
                    </IonButton>
                  </IonButtons>
                </IonCol>
              </IonRow>
              <IonRow>
                {unit.status === 'OK'
                ?
                <IonCol><p className='align-center'>Status: <IonText color='success'>{unit.status}</IonText></p></IonCol>
                :
                <IonCol><p className='align-center'>Status: <IonText color='danger'>{unit.status}</IonText></p></IonCol>
                }
              </IonRow>
              <IonRow>
                <IonCol size='6' offset='6'>
                  <IonText>
                    <p className='moist-percent'>{unit.moistLevel * 100}%</p>
                  </IonText>
                </IonCol>
              </IonRow>
              <IonRow class="ion-align-items-center">
                <IonCol>
                  <IonText>
                    <p className='align-center'>Moist level:</p>
                  </IonText>
                </IonCol>
                <IonCol>
                  <IonProgressBar value={unit.moistLevel} color={setColor(unit)}></IonProgressBar>               
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol>
                  <IonText>
                    <p className='last-time-watered'>Last time watered: <br/> {unit.log[0]} </p>
                  </IonText>
                </IonCol>
              </IonRow>
              <IonRow class="ion-align-items-center">
                <IonCol class='ion-text-center'>
                  <IonButton shape='round' expand='block' color='danger'>Log</IonButton>
                </IonCol>
                <IonCol class='ion-text-center'>
                  <IonButton shape='round' expand='block' color='primary'>Water now</IonButton>
                </IonCol>
              </IonRow>
            </IonGrid>  
          </IonCard>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Home;
