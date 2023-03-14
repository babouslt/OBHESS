import React from 'react';

const Index = ({list, onChange, device, name}) => {

    return (
        <div>
            <select value={device} onChange={onChange} name={name}>
                {list.map(element => (
                    <option key={element.deviceId} value={element.deviceId}>
                        {element.label || `Microphone ${element.deviceId}`}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default Index;
