import Portal from '../Portal/Portal';

import './modal.css';

const Modal = ({
	children,
    isNoBlur,
	onClose,
	onConfirm,
}) => {

	return (
		<Portal>
			<div className='container'>
				<div className='modal'>
                    {children}
				</div>
			</div>
		</Portal>
	)
}

export default Modal;