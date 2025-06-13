// src/components/ProfilePanel.js

import PropTypes from 'prop-types';
import {Component, createRef} from 'react';
import {Panel} from '@enact/sandstone/Panels';
import Scroller from '@enact/sandstone/Scroller';
import {InputField} from '@enact/sandstone/Input';
import Heading from '@enact/sandstone/Heading';
import Button from '@enact/sandstone/Button';
import Alert from '@enact/sandstone/Alert';

import './profile.css';

import avatar2 from './assets/avatar2.jpg';
import avatar3 from './assets/avatar3.jpg';

class Profile extends Component {
  static propTypes = {
    userName: PropTypes.string,
    userEmail: PropTypes.string,
    bio: PropTypes.string,
    onChangeBio: PropTypes.func.isRequired,
    onSelectAvatar: PropTypes.func.isRequired,
    onClickAddAvatar: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    this.avatarSources = [
      avatar2, avatar3, avatar2, avatar3,
      avatar2, avatar3, avatar2,
    ];

    this.state = {
      mainPhoto: avatar2,
      localBio: props.bio || '',
      showAlert: false    // Alert 표시 상태 추가
    };

    this.fileInputRef = createRef();

    // 핸들러 바인딩
    this.handleBioChange = this.handleBioChange.bind(this);
    this.handleAvatarClick = this.handleAvatarClick.bind(this);
    this.handleAddAvatarClick = this.handleAddAvatarClick.bind(this);
    this.handleFileInputChange = this.handleFileInputChange.bind(this);
    this.handleShowAlert = this.handleShowAlert.bind(this);
    this.handleCloseAlert = this.handleCloseAlert.bind(this);
  }

  handleBioChange(ev) {
    const newBio = ev.value;
    this.setState({localBio: newBio});
    this.props.onChangeBio(newBio);
  }

  handleAvatarClick(idx) {
    const src = this.avatarSources[idx];
    this.setState({mainPhoto: src});
    if (this.props.onSelectAvatar) {
      this.props.onSelectAvatar(idx);
    }
  }

  handleAddAvatarClick() {
    if (this.fileInputRef && this.fileInputRef.current) {
      this.fileInputRef.current.click();
    }
  }

  handleFileInputChange(ev) {
    const file = ev.target.files[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      this.setState({mainPhoto: objectUrl});
      if (this.props.onClickAddAvatar) {
        this.props.onClickAddAvatar();
      }
    }
    // 동일 파일 재업로드 허용
    ev.target.value = '';
  }

  handleShowAlert() {
    this.setState({showAlert: true});
  }

  handleCloseAlert() {
    this.setState({showAlert: false});
  }

  render() {
    const {
      userName = '시원',
      userEmail = 'pso9789@yonsei.ac.kr'
    } = this.props;
    const {mainPhoto, localBio, showAlert} = this.state;
    const avatars = this.avatarSources;

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
                {avatars.map((src, i) => (
                  <Button
                    className="profile-avatar-button"
                    key={i}
                    size="small"
                    onClick={this.handleAvatarClick.bind(this, i)}
                    aria-label={`아바타 ${i+1}`}
                  >
                    <img
                      src={src}
                      alt={`avatar-${i+1}`}
                    />
                  </Button>
                ))}
                <Button
                  size="small"
                  className="file-upload-button"
                  onClick={this.handleAddAvatarClick}
                  aria-label="프로필 사진 업로드"
                > &nbsp; +
                </Button>
                <input
                  type="file"
                  ref={this.fileInputRef}
                  accept="image/*"
                  style={{display: 'none'}}
                  onChange={this.handleFileInputChange}
                />
              </div>
            </div>
            <div className="profile-info">
              <div className="profile-info-label">이름</div>
              <div className="profile-info-value">{userName}</div>
              <div className="profile-info-label">이메일</div>
              <div className="profile-info-value">{userEmail}</div>
            </div>
            <div>
              <div className="profile-bio-label">소개글</div>
              <InputField
                placeholder="안녕하세요."
                component="textarea"
                className="profile-bio-textarea"
                value={localBio}
                onChange={this.handleBioChange}
              />
            </div>
            {/* Alert 버튼/팝업 */}
            <div className="profile-footer">
              <Button
                size="small"
                className="profile-save-button"
                onClick={this.handleShowAlert}
              >
                저장
              </Button>
              {showAlert && (
                <Alert
                  type="fullscreen"
                  open={true}
                  onClose={this.handleCloseAlert}
                  title="알림"
                >
                  <buttons>
                    <Button onClick={this.handleCloseAlert}>확인</Button>
                  </buttons>
                  저장되었습니다!
                </Alert>
              )}
            </div>
          </div>
        </Scroller>
      </Panel>
    );
  }
}

export default Profile;
