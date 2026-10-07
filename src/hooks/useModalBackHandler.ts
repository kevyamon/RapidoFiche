import { useEffect, useRef } from 'react';

/**
 * Hook pour intercepter le bouton "Retour" physique ou virtuel du smartphone
 * afin de refermer la modale sans quitter la page ni l'application.
 */
export const useModalBackHandler = (
  isOpen: boolean,
  onClose: () => void,
  modalKey = 'modal'
): void => {
  const isPushedRef = useRef<boolean>(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) {
      if (isPushedRef.current) {
        isPushedRef.current = false;
        if (window.history.state?.modalKey === modalKey) {
          window.history.back();
        }
      }
      return;
    }

    window.history.pushState({ modalOpen: true, modalKey }, '');
    isPushedRef.current = true;

    const handlePopState = () => {
      isPushedRef.current = false;
      onCloseRef.current();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, modalKey]);
};
