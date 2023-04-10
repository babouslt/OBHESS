import React from 'react';
import styled from 'styled-components';

const Index = ({list, onChange, device, name}) => {

    return (
        <Container>
            <Dropdown value={device} onChange={onChange} name={name}>
                {list.map(element => (
                    <option key={element.deviceId} value={element.deviceId}>
                        {element.label || `Microphone ${element.deviceId}`}
                    </option>
                ))}   
            </Dropdown>
        </Container>
    );
}

const Dropdown = styled.select`
  font-size: 16px;
  border: none;
  border-radius: 5px;
  background-color: #f8f8f8;
  color: #333;
  cursor: pointer;
  outline: none;
  text-align: center;
`

const Container = styled.div`
   padding-top:10px;
   
   
`
export default Index;
