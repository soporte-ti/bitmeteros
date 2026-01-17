/*global $,BITMETER,window,config*/
/*jslint onevar: true, undef: true, nomen: true, eqeqeq: true, bitwise: true, regexp: true, newcap: true, immed: true, strict: false */

BITMETER.tabShowCalc = function(){
};

$(function(){
    var bytesPerK         = BITMETER.getBytesPerK(),
        timeInput         = $('#calcHowMuchTimeInput'),
        howMuchSpeedInput = $('#calcHowMuchSpeedInput'),
        calcHowMuchResult = $('#calcHowMuchResult'),
        calcHowMuchDesc   = $('#calcHowMuchDesc'),
        amountInput       = $('#calcHowLongAmountInput'),
        howLongSpeedInput = $('#calcHowLongSpeedInput'),
        calcHowLongResult = $('#calcHowLongResult'),
        calcHowLongDesc   = $('#calcHowLongDesc'),
        parseTimeValue;
    
    function parseSpeed(txt){
        var num = Number(txt);
        if (!isNaN(num)){
            return num * bytesPerK;   
        } else {
            return null;   
        }
    }

    parseTimeValue = (function(){
        var WHITESPACE_REGEX = /\s/g,
            DIGIT_REGEX      = /^\d$/,
            NUM_REGEX        = /^\d+$/;
        
        return function(txt){
            var num, totalInSeconds = 0, numBuffer = '', c, i, len, tmpTxt = txt.replace(WHITESPACE_REGEX, '').toLowerCase();
            
            if (NUM_REGEX.test(tmpTxt)){
             // Just numbers, so this is the number of seconds
                return Number(tmpTxt);
                
            } else {
                len = tmpTxt.length;
                for (i=0; i<len; i++){
                    c = tmpTxt[i];
                    if (DIGIT_REGEX.test(c)){
                        numBuffer += c;
                    } else {
                        if (!numBuffer){
                            return null;   
                        } else {
                            num = Number(numBuffer);
                            if (c === 'd') {
                                totalInSeconds += (num * 3600 * 24);
                            } else if (c === 'h') {
                                totalInSeconds += (num * 3600);
                            } else if (c === 'm') {
                                totalInSeconds += (num * 60);
                            } else if (c === 's') {
                                totalInSeconds += num;
                            }                            
                            numBuffer = '';
                        }
                    }
                }
                return totalInSeconds;
            }
        };
    }());
    
    function updateHowMuchResult(){
        var time, speed, result = '', desc = '',
            gotTime = !!timeInput.val(),
            gotSpeed  = !!howMuchSpeedInput.val();

        if (gotTime && gotSpeed){
            time  = parseTimeValue(timeInput.val());
            speed = parseSpeed(howMuchSpeedInput.val());
            
            if (time !== null && speed !== null){
                result = BITMETER.formatDataAmount(time * speed);
                desc   = 'Transferred in ' + BITMETER.formatInterval(time, BITMETER.formatInterval.LONG) + ' at ' + BITMETER.formatAmount(speed) + '/s';
            } else {
                result = '?';
                if (time === null){
                    desc = 'Did not understand the Time value. ';
                }
                if (speed === null){
                    desc = (desc ? desc + '<br>' : '');
                    desc += 'Did not understand the Speed value. ';
                }
            }
        }
        
        calcHowMuchResult.html(result);
        calcHowMuchDesc.html(desc);
    }
    
    function updateHowLongResult(){
        var amount, speed, result = '', desc = '', gotAmount = !!amountInput.val(),
            gotSpeed  = !!howLongSpeedInput.val();

        if (gotAmount && gotSpeed){
            amount = BITMETER.parseAmountValue(amountInput.val());
            speed = parseSpeed(howLongSpeedInput.val());
            
            if (amount !== null && speed !== null){
                if (speed === 0){
                    result = 'Never';    
                    desc   = 'Transfer will never complete when speed is 0';   
                } else {
                    result = BITMETER.formatInterval(amount/speed, BITMETER.formatInterval.SHORT);
                    desc   = 'To transfer ' + BITMETER.formatDataAmount(amount) + ' at ' + BITMETER.formatAmount(speed) + '/s';
                }    
            } else {
                result = '?';
                if (amount === null){
                    desc = 'Did not understand the Amount value. ';
                }
                if (speed === null){
                    desc = (desc ? desc + '<br>' : '');
                    desc += 'Did not understand the Speed value. ';
                }
            }
        }
        
        calcHowLongResult.html(result);
        calcHowLongDesc.html(desc);
    }
    
    $('#calcHowLongSpeedInput').keyup(function(e){
        updateHowLongResult();
    });
    $('#calcHowMuchSpeedInput').keyup(function(e){
        updateHowMuchResult();
    });
    amountInput.keyup(function(e){
        updateHowLongResult();
    });
    timeInput.keyup(function(e){
        updateHowMuchResult();
    });

    howLongSpeedInput.val(Math.round(BITMETER.model.getMonitorScale() / (2 * bytesPerK)));
    howMuchSpeedInput.val(Math.round(BITMETER.model.getMonitorScale() / (2 * bytesPerK)));
});
