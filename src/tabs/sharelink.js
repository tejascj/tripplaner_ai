import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import {
    EmailShareButton,
    FacebookShareButton,
    FacebookIcon,
    PinterestShareButton,
    RedditShareButton,
    TelegramShareButton,
    LinkedinShareButton,
    TwitterShareButton,
    WhatsappShareButton,
    EmailIcon,
    RedditIcon,
    TelegramIcon,
    WhatsappIcon,
    TwitterIcon,
    LinkedinIcon,
    PinterestIcon,
    FacebookMessengerIcon,
    FacebookMessengerShareButton,
} from "react-share";

function PopupShareModal(props) {
    const { link = props.imageUrl,isCopied,show} = props;
    const [Copied, setCopied] = useState(isCopied);
    const [showmodal, setShowmodal] = useState(show);
    
    const handleCopy = () => {
        navigator.clipboard.writeText(link);
        setCopied(true);
    };
    const handleClose = () => {
        setShowmodal(false);
    }
    return (
        <>   
            <Modal show={showmodal} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Share Modal</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Share this link via</p>
                    <EmailShareButton url={link}>
                        <EmailIcon size={32} round />
                    </EmailShareButton>
                    <FacebookMessengerShareButton url={link}>
                        <FacebookMessengerIcon size={32} round />
                    </FacebookMessengerShareButton>
                    <FacebookShareButton url={link}>
                        <FacebookIcon size={32} round />
                    </FacebookShareButton>
                    
                    <TwitterShareButton url={link}>
                        <TwitterIcon size={32} round />
                    </TwitterShareButton>
                    <WhatsappShareButton url={link}>
                        <WhatsappIcon size={32} round />
                    </WhatsappShareButton>
                    <TelegramShareButton url={link}>
                        <TelegramIcon size={32} round />
                    </TelegramShareButton>
                    <LinkedinShareButton url={link}>
                        <LinkedinIcon size={32} round />
                    </LinkedinShareButton>
                    <PinterestShareButton url={link}>
                        <PinterestIcon size={32} round />
                    </PinterestShareButton>
                    <RedditShareButton url={link}>
                        <RedditIcon size={32} round />
                    </RedditShareButton>
                    <hr />
                    <p>Or copy link</p>
                    <div className="input-group mb-3">
                        <input type="text" className="form-control" value={link} readOnly />
                        <Button variant="outline-secondary" onClick={handleCopy}>{Copied ? 'Copied' : 'Copy'}</Button>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
}
export default PopupShareModal;
