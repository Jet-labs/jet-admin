const dgram = require('dgram');

/**
 * Syslog Generator Script
 * 
 * Usage:
 * node syslog-generator.js [port] [message] [count] [interval_ms]
 * 
 * Examples:
 * node syslog-generator.js
 * node syslog-generator.js 514 "Custom test message" 10 1000
 */

// Parse command line arguments with defaults
const args = process.argv.slice(2);
const port = parseInt(args[0], 10) || 514;
const messageTemplate = args[1] || "Test syslog message {{index}} from Jet Admin generator";
const totalCount = parseInt(args[2], 10) || 1;
const intervalMs = parseInt(args[3], 10) || 1000;
const host = '127.0.0.1';

const client = dgram.createSocket('udp4');
let currentIndex = 1;

// Helper to generate RFC3164 compliant syslog message
function formatSyslogMessage(message, priority = 14) {
    // priority 14 = user-level messages (1) * 8 + info severity (6)
    const timestamp = new Date().toISOString();
    return `<${priority}>${timestamp} localhost jet-syslog-gen: ${message}`;
}

function sendNextMessage() {
    if (currentIndex > totalCount) {
        console.log(`\n✅ Finished sending ${totalCount} messages to ${host}:${port}`);
        client.close();
        return;
    }

    const customMessage = messageTemplate.replace('{{index}}', currentIndex);
    const syslogPacket = formatSyslogMessage(customMessage);
    const messageBuffer = Buffer.from(syslogPacket);

    client.send(messageBuffer, 0, messageBuffer.length, port, host, (err) => {
        if (err) {
            console.error(`❌ Error sending message ${currentIndex}:`, err);
            client.close();
            process.exit(1);
        } else {
            console.log(`[${currentIndex}/${totalCount}] Sent to ${host}:${port} -> ${customMessage}`);
        }
        
        currentIndex++;
        
        if (currentIndex <= totalCount) {
            setTimeout(sendNextMessage, intervalMs);
        } else {
            // Close immediately if done
            sendNextMessage(); 
        }
    });
}

console.log(`🚀 Starting Syslog Generator`);
console.log(`Target: UDP ${host}:${port}`);
console.log(`Count: ${totalCount} messages`);
console.log(`Interval: ${intervalMs}ms`);
console.log(`-----------------------------------`);

// Start sending
sendNextMessage();
