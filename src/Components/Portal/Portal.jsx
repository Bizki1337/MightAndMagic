import { createPortal } from 'react-dom';

const modalRoot = document.getElementById('modal')

const Portal = ({children}) => createPortal(children, modalRoot)

export default Portal;