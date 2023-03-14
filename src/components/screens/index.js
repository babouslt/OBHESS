import React from 'react';

const Index = ({list, onChange, device, name}) => {
    return (
        <div>
            <select value={device} onChange={onChange} name={name}>
                {list.map((screen,index) => (
                    <option key={index} value={screen.id}>
                        {screen.name || `Screen ${screen.id}`}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default Index;
