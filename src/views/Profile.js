import PropTypes from 'prop-types';
import { useState, useRef, useEffect } from 'react';
import { Panel } from '@enact/sandstone/Panels';
import Scroller from '@enact/sandstone/Scroller';
import { InputField } from '@enact/sandstone/Input';
import Heading from '@enact/sandstone/Heading';
import Button from '@enact/sandstone/Button';
import Alert from '@enact/sandstone/Alert';
import axios from 'axios';

import './profile.css';

import avatar2 from './assets/avatar2.jpg';
import avatar3 from './assets/avatar3.jpg';

const Profile = ({
  token,
  onChangeBio = () => {},
  onSelectAvatar = () => {},
  onClickAddAvatar = () => {}
}) => {
  const avatarSources = [
    avatar2, avatar3, avatar2, avatar3,
    avatar2, avatar3, avatar2,
  ];

  const [userName, setUserName] = useState('');

  const [mainPhoto, setMainPhoto] = useState(avatar2); // 미리보기용 (url)
  const [localBio, setLocalBio] = useState('');
  const [selectedFile, setSelectedFile] = useState(null); // 실제 업로드용

  const [showAlert, setShowAlert] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  // 회원 정보 받아오기
  useEffect(() => {
    if (!token) return;
    axios.get('/members/my', {
      headers: {
        'Authorization': token, // Bearer 없이 토큰만!
      }
    })
    .then(response => {
      if (response.data.isSuccess) {
        const userData = response.data.result;
        setUserName(userData.nickname || '');
        setMainPhoto(userData.profileImageUrl || avatar2);
        setLocalBio(userData.description || '');
        setSelectedFile(null); // 초기화
      }
    })
    // eslint-disable-next-line no-unused-vars
    .catch(error => {
      setShowError(true);
      setErrorMessage("회원 정보를 가져오는 데 실패했습니다.");
      console.error(error);
    });
    // eslint-disable-next-line
  }, [token]);

  const handleBioChange = (ev) => {
    setLocalBio(ev.value);
    onChangeBio(ev.value);
  };

  const handleAvatarClick = async (idx) => {
    const src = avatarSources[idx];
    setMainPhoto(src);
    // avatar 이미지 URL을 fetch해서 File로 변환
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const file = new File([blob], `avatar${idx+1}.png`, { type: blob.type });
      setSelectedFile(file);
    } catch (e) {
      setSelectedFile(null);
    }
    onSelectAvatar(idx);
  };

  const handleAddAvatarClick = () => {
    if (fileInputRef && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileInputChange = (ev) => {
    const file = ev.target.files[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setMainPhoto(objectUrl); // 미리보기용
      setSelectedFile(file);   // 실제 업로드용
      onClickAddAvatar();
    }
    ev.target.value = '';
  };

  const handleSave = () => {
    const formData = new FormData();

    // 서버에서는 file만 profileImage로 인식, 없으면 기존 유지
    if (selectedFile) {
      formData.append('profileImage', selectedFile); // 반드시 File 객체
    }

    formData.append('description', localBio);

    axios.post('/members/my', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': token, // Bearer 없이!
      }
    })
    .then(response => {
      if (response.data.isSuccess) {
        setShowAlert(true);
        setShowError(false);
        // 새 이미지 반영(갱신)
        if (response.data.result && response.data.result.profileImageUrl) {
          setMainPhoto(response.data.result.profileImageUrl);
        }
        setSelectedFile(null);
      } else {
        setShowError(true);
        setErrorMessage(response.data.message);
      }
    })
    // eslint-disable-next-line no-unused-vars
    .catch(error => {
      setShowError(true);
      setErrorMessage('서버와 연결할 수 없습니다. 다시 시도해주세요.');
    });
  };

  const handleCloseAlert = () => setShowAlert(false);

  return (
    <Panel>
      <Scroller>
        <div className="profile-container">
          <Heading className="profile-title">프로필</Heading>
          <div className="profile-top">
            <img
              src={mainPhoto}
              alt="프로필 사진"
              className="profile-photo"
            />
            <div className="profile-avatar-list">
              {avatarSources.map((src, i) => (
                // eslint-disable-next-line react/jsx-no-bind
                <Button
                  className="profile-avatar-button"
                  key={i}
                  size="small"
                  // eslint-disable-next-line react/jsx-no-bind
                  onClick={() => handleAvatarClick(i)}
                  aria-label={`아바타 ${i + 1}`}
                >
                  <img src={src} alt={`avatar-${i + 1}`} />
                </Button>
              ))}
              {/* eslint-disable-next-line react/jsx-no-bind */}
              <Button
                size="small"
                className="file-upload-button"
                // eslint-disable-next-line react/jsx-no-bind
                onClick={handleAddAvatarClick}
                aria-label="프로필 사진 업로드"
              >
                &nbsp; +
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                style={{ display: 'none' }}
                // eslint-disable-next-line react/jsx-no-bind
                onChange={handleFileInputChange}
              />
            </div>
          </div>
          <div className="profile-info">
            <div className="profile-info-label">이름</div>
            <div className="profile-info-value">{userName}</div>
          </div>
          <div>
            <div className="profile-bio-label">소개글</div>
            {/* eslint-disable-next-line react/jsx-no-bind */}
            <InputField
              placeholder="자기소개를 입력하세요."
              component="textarea"
              className="profile-bio-textarea"
              value={localBio}
              // eslint-disable-next-line react/jsx-no-bind
              onChange={handleBioChange}
            />
          </div>
          {/* Alert 버튼/팝업 */}
          <div className="profile-footer">
            {/* eslint-disable-next-line react/jsx-no-bind */}
            <Button
              size="small"
              className="profile-save-button"
              // eslint-disable-next-line react/jsx-no-bind
              onClick={handleSave}
            >
              저장
            </Button>
            {showAlert && (
              <Alert
                type="fullscreen"
                // eslint-disable-next-line react/jsx-boolean-value
                open={true}
                // eslint-disable-next-line react/jsx-no-bind
                onClose={handleCloseAlert}
                title="알림"
              >
                <buttons>
                  {/* eslint-disable-next-line react/jsx-no-bind */}
                  <Button onClick={handleCloseAlert}>확인</Button>
                </buttons>
                저장되었습니다!
              </Alert>
            )}
            {showError && (
              <Alert
                type="fullscreen"
                // eslint-disable-next-line react/jsx-boolean-value
                open={true}
                // eslint-disable-next-line react/jsx-no-bind
                onClose={handleCloseAlert}
                title="오류"
              >
                {errorMessage}
              </Alert>
            )}
          </div>
        </div>
      </Scroller>
    </Panel>
  );
};

Profile.propTypes = {
  token: PropTypes.string.isRequired,
  onChangeBio: PropTypes.func,
  onSelectAvatar: PropTypes.func,
  onClickAddAvatar: PropTypes.func,
};

export default Profile;
