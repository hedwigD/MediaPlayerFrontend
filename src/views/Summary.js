import React from 'react';
import PropTypes from 'prop-types';
import {Panel} from '@enact/sandstone/Panels';
import Scroller from '@enact/sandstone/Scroller';
import Heading from '@enact/sandstone/Heading';
import BodyText from '@enact/sandstone/BodyText';

const containerStyle = { padding: '1rem' };
const bodyTextStyle = { whiteSpace: 'pre-wrap', marginTop: '1rem' };

const hardcodedSummary = `
[Virtual Memory 강의 요약]

1. 가상 메모리 개념
- 물리 메모리(RAM)보다 큰 주소 공간을 프로세스에 제공하기 위한 기술
- 프로그램은 연속된 메모리를 사용하는 것처럼 보이지만, 실제로는 페이지 단위로 분할되어 저장됨

2. 페이지와 프레임
- 페이지(Page): 가상 주소 공간을 고정 크기로 나눈 블록
- 프레임(Frame): 물리 메모리를 같은 크기로 나눈 블록
- MMU(Memory Management Unit)가 페이지와 프레임을 매핑

3. 페이지 테이블
- 각 프로세스마다 존재하며, 가상 페이지 번호 → 물리 프레임 번호로 변환
- 페이지 테이블 엔트리에는 valid bit, dirty bit, access 권한 등의 메타데이터 포함

4. 페이지 폴트 (Page Fault)
- 접근하려는 페이지가 메모리에 없는 경우 발생
- 운영체제가 디스크에서 해당 페이지를 로딩하고, 페이지 테이블을 갱신

5. 주소 변환
- CPU는 가상 주소를 생성 → MMU가 페이지 테이블을 이용해 물리 주소로 변환
- 변환 속도 향상을 위해 TLB(Translation Lookaside Buffer) 사용

6. TLB (캐시 역할)
- 최근 사용한 페이지 번호와 프레임 번호 매핑을 캐싱
- TLB miss 발생 시 페이지 테이블 접근 필요 (느림)

7. 페이지 교체 알고리즘
- FIFO, LRU, Optimal 등의 알고리즘 사용
- 메모리가 가득 찼을 때 어떤 페이지를 제거할지 결정

8. 가상 메모리 장점
- 메모리 보호 및 격리
- 다중 프로그램 실행 가능
- 효율적인 메모리 사용

※ 실제 동작 시, 페이징 기법과 디스크 입출력 시간 간 차이가 매우 크므로 효율적인 캐시/교체 정책이 중요함
`;

const Summary = () => {
  return (
    <Panel>
      <Scroller>
        <div style={containerStyle}>
          <Heading>Virtual Memory 강의 요약</Heading>
          <BodyText style={bodyTextStyle}>{hardcodedSummary}</BodyText>
        </div>
      </Scroller>
    </Panel>
  );
};

export default Summary;