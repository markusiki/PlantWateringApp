import { IonLoading } from '@ionic/react'
import { ILoadingSpinnerProps } from '../interfaces'

const LoadingSpinner: React.FC<ILoadingSpinnerProps> = ({ isOpen, message }) => {
  return <IonLoading isOpen={isOpen} message={message}></IonLoading>
}

export default LoadingSpinner
