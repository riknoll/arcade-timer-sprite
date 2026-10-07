namespace timerSprite {
    export enum Mode {
        Countdown,
        Stopwatch
    }

    export enum Format {
        //% block="HH:MM:SS.mm"
        HH_MM_SS_MM = 1 << 1,
        //% block="HH:MM:SS"
        HH_MM_SS = 1 << 2,
        //% block="MM:SS.mm"
        MM_SS_MM = 1 << 3,
        //% block="MM:SS"
        MM_SS = 1 << 4,
        //% block="SS.mm"
        SS_MM = 1 << 5,
        //% block="SS"
        SS = 1 << 6,
    }

    export class TimerSprite extends sprites.ExtendableSprite {
        protected digits: Image[];
        protected smallDigits: Image[];

        protected colon: Image;
        protected period: Image;

        protected colonWidth: number;
        protected digitWidth: number;
        protected smallDigitWidth: number;
        protected periodWidth: number;

        protected padding: number;
        protected borderWidth: number;

        protected backgroundColor: number;
        protected borderColor: number;
        protected frame: Image;

        protected currentTime: number;
        protected countdownTime: number;

        protected running: boolean;

        protected mode: Mode;
        protected formatFlags: number;


        constructor(kind: number) {
            super(img`.`, kind);

            this.digits = timerSprite.DEFAULT_DIGITS;
            this.colon = timerSprite.DEFAULT_COLON;
            this.period = timerSprite.DEFAULT_PERIOD;

            this.running = false;
            this.mode = Mode.Stopwatch;
            this.currentTime = 0;
            this.countdownTime = 0;

            this.padding = 0;
            this.borderWidth = 0;

            this.backgroundColor = 0;
            this.borderColor = 0;


            this.formatFlags = Format.MM_SS | Format.SS_MM;

            this.recalculateDimensions();
        }

        setMode(mode: Mode) {
            this.mode = mode;
        }

        startCountdown(countdownTime: number) {
            this.countdownTime = countdownTime;
            this.currentTime = 0;
            this.mode = Mode.Countdown;
            this.running = true;
        }

        setCharacterWidths(digitWidth: number, colonWidth: number, periodWidth: number, smallDigitWidth?: number) {
            this.digitWidth = digitWidth;
            this.colonWidth = colonWidth;
            this.periodWidth = periodWidth;
            this.smallDigitWidth = smallDigitWidth || digitWidth;

            this.recalculateDimensions();
        }

        setFormatEnabled(format: Format, enabled: boolean) {
            if (enabled) {
                this.formatFlags |= format;
            } else {
                this.formatFlags &= ~format;
            }
            this.recalculateDimensions();
        }

        setElapsedTime(millis: number) {
            this.currentTime = millis;
        }

        setColors(backgroundColor: number, borderColor: number) {
            this.backgroundColor = backgroundColor;
            this.borderColor = borderColor;
        }

        setFrame(frame: Image) {
            this.frame = frame;
            this.recalculateDimensions();
        }

        setPadding(padding: number) {
            this.padding = padding;
            this.recalculateDimensions();
        }

        setBorderWidth(borderWidth: number) {
            this.borderWidth = borderWidth;
            this.recalculateDimensions();
        }

        setRunning(running: boolean) {
            this.running = running;
        }


        update(deltaTimeMillis: number) {
            if (!this.running) return;

            this.currentTime += deltaTimeMillis;
        }

        draw(drawLeft: number, drawTop: number) {
            let currentSeconds = Math.idiv(this.currentTime, 1000);
            let formatToDraw = Format.HH_MM_SS;

            if (currentSeconds < 60) {
                if (this.formatFlags & Format.SS_MM) {
                    formatToDraw = Format.SS_MM;
                }
                else if (this.formatFlags & Format.SS) {
                    formatToDraw = Format.SS;
                }
                else if (this.formatFlags & Format.MM_SS_MM) {
                    formatToDraw = Format.MM_SS_MM;
                }
                else if (this.formatFlags & Format.MM_SS) {
                    formatToDraw = Format.MM_SS;
                }
                else if (this.formatFlags & Format.HH_MM_SS_MM) {
                    formatToDraw = Format.HH_MM_SS_MM;
                }
                else if (this.formatFlags & Format.HH_MM_SS) {
                    formatToDraw = Format.HH_MM_SS;
                }
            }
            else if (currentSeconds < 3600) {
                if (this.formatFlags & Format.MM_SS_MM) {
                    formatToDraw = Format.MM_SS_MM;
                }
                else if (this.formatFlags & Format.MM_SS) {
                    formatToDraw = Format.MM_SS;
                }
                else if (this.formatFlags & Format.HH_MM_SS_MM) {
                    formatToDraw = Format.HH_MM_SS_MM;
                }
                else if (this.formatFlags & Format.HH_MM_SS) {
                    formatToDraw = Format.HH_MM_SS;
                }
                else if (this.formatFlags & Format.SS_MM) {
                    formatToDraw = Format.SS_MM;
                }
                else if (this.formatFlags & Format.SS) {
                    formatToDraw = Format.SS;
                }
            }
            else {
                if (this.formatFlags & Format.HH_MM_SS_MM) {
                    formatToDraw = Format.HH_MM_SS_MM;
                }
                else if (this.formatFlags & Format.HH_MM_SS) {
                    formatToDraw = Format.HH_MM_SS;
                }
                else if (this.formatFlags & Format.MM_SS_MM) {
                    formatToDraw = Format.MM_SS_MM;
                }
                else if (this.formatFlags & Format.MM_SS) {
                    formatToDraw = Format.MM_SS;
                }
                else if (this.formatFlags & Format.SS_MM) {
                    formatToDraw = Format.SS_MM;
                }
                else if (this.formatFlags & Format.SS) {
                    formatToDraw = Format.SS;
                }
            }

            if (this.mode === Mode.Countdown) {
                this.drawTimeCore(drawLeft, drawTop, this.countdownTime - this.currentTime, formatToDraw);
            }
            else {
                this.drawTimeCore(drawLeft, drawTop, this.currentTime, formatToDraw);
            }
        }

        protected drawTimeCore(left: number, top: number, millis: number, format: number) {
            millis = Math.max(0, millis);
            const hours = Math.floor(millis / 3600000);
            const minutes = Math.floor((millis % 3600000) / 60000);
            const seconds = Math.floor((millis % 60000) / 1000);
            const centiSeconds = Math.floor((millis % 1000) / 10);

            const colonWidth = this.colonWidth || this.colon.width + 1;
            const periodWidth = this.periodWidth || this.period.width + 1;
            const digitWidth = this.digitWidth || this.digits[0].width + 1;
            const smallDigitWidth = this.smallDigitWidth || (this.smallDigits ? this.smallDigits[0].width + 1 : digitWidth);

            let frameWidth = 0;
            if (this.frame) {
                frameWidth = Math.idiv(this.frame.width, 3);
                drawFrame(screen, this.frame, left, top, this.width, this.height);
            }

            if (this.borderColor) {
                screen.fillRect(
                    left + frameWidth,
                    top + frameWidth,
                    this.width - (frameWidth << 1),
                    this.height - (frameWidth << 1),
                    this.borderColor
                );
            }
            if (this.backgroundColor) {
                screen.fillRect(
                    left + this.borderWidth + frameWidth,
                    top + this.borderWidth + frameWidth,
                    this.width - (this.borderWidth << 1) - (frameWidth << 1),
                    this.height - (this.borderWidth << 1) - (frameWidth << 1),
                    this.backgroundColor
                );
            }

            left += this.padding + this.borderWidth + frameWidth;
            const width = this.getWidthForFormat(format) + ((this.padding + this.borderWidth + frameWidth) << 1);
            left += (this.width - width) >> 1;

            const characterBottom = top + this.height - (this.padding + this.borderWidth + frameWidth);
            if (format === Format.HH_MM_SS_MM) {
                this.drawNumber(left, characterBottom, hours, this.digits, digitWidth);
                left += digitWidth * 2;
                screen.drawTransparentImage(this.colon, left, characterBottom - this.colon.height);
                left += colonWidth;

                this.drawNumber(left, characterBottom, minutes, this.digits, digitWidth);
                left += digitWidth * 2;
                screen.drawTransparentImage(this.colon, left, characterBottom - this.colon.height);
                left += colonWidth;

                this.drawNumber(left, characterBottom, seconds, this.digits, digitWidth);
                left += digitWidth * 2;
                screen.drawTransparentImage(this.period, left, characterBottom - this.period.height);
                left += periodWidth;

                if (this.smallDigits) {
                    this.drawNumber(left, characterBottom, centiSeconds, this.smallDigits, smallDigitWidth);
                }
                else {
                    this.drawNumber(left, characterBottom, centiSeconds, this.digits, digitWidth);
                }
            } else if (format === Format.HH_MM_SS) {
                this.drawNumber(left, characterBottom, hours, this.digits, digitWidth);
                left += digitWidth * 2;
                screen.drawTransparentImage(this.colon, left, characterBottom - this.colon.height);
                left += colonWidth;

                this.drawNumber(left, characterBottom, minutes, this.digits, digitWidth);
                left += digitWidth * 2;
                screen.drawTransparentImage(this.colon, left, characterBottom - this.colon.height);
                left += colonWidth;

                this.drawNumber(left, characterBottom, seconds, this.digits, digitWidth);
            } else if (format === Format.MM_SS_MM) {
                this.drawNumber(left, characterBottom, minutes, this.digits, digitWidth);
                left += digitWidth * 2;
                screen.drawTransparentImage(this.colon, left, characterBottom - this.colon.height);
                left += colonWidth;

                this.drawNumber(left, characterBottom, seconds, this.digits, digitWidth);
                left += digitWidth * 2;
                screen.drawTransparentImage(this.period, left, characterBottom - this.period.height);
                left += periodWidth;

                if (this.smallDigits) {
                    this.drawNumber(left, characterBottom, centiSeconds, this.smallDigits, smallDigitWidth);
                }
                else {
                    this.drawNumber(left, characterBottom, centiSeconds, this.digits, digitWidth);
                }
            } else if (format === Format.MM_SS) {
                this.drawNumber(left, characterBottom, minutes, this.digits, digitWidth);
                left += digitWidth * 2;
                screen.drawTransparentImage(this.colon, left, characterBottom - this.colon.height);
                left += colonWidth;

                this.drawNumber(left, characterBottom, seconds, this.digits, digitWidth);
            } else if (format === Format.SS_MM) {
                this.drawNumber(left, characterBottom, seconds, this.digits, digitWidth);
                left += digitWidth * 2;
                screen.drawTransparentImage(this.period, left, characterBottom - this.period.height);
                left += periodWidth;

                if (this.smallDigits) {
                    this.drawNumber(left, characterBottom, centiSeconds, this.smallDigits, smallDigitWidth);
                }
                else {
                    this.drawNumber(left, characterBottom, centiSeconds, this.digits, digitWidth);
                }
            } else if (format === Format.SS) {
                this.drawNumber(left, characterBottom, seconds, this.digits, digitWidth);
            }
        }

        protected drawNumber(left: number, bottom: number, value: number, digits: Image[], digitWidth: number) {
            if (value < 10) {
                screen.drawTransparentImage(digits[0], left, bottom - digits[0].height);
                screen.drawTransparentImage(digits[value], left + digitWidth, bottom - digits[value].height);
            }
            else {
                const tens = Math.idiv(value, 10) % 10;
                const ones = value % 10;
                screen.drawTransparentImage(digits[tens], left, bottom - digits[tens].height);
                screen.drawTransparentImage(digits[ones], left + digitWidth, bottom - digits[ones].height);
            }
        }

        protected recalculateDimensions() {
            const prevX = this.x;
            const prevY = this.y;
            let frameWidth = this.frame ? Math.idiv(this.frame.width, 3) : 0;

            const allFormats = [Format.HH_MM_SS_MM, Format.HH_MM_SS, Format.MM_SS_MM, Format.MM_SS, Format.SS_MM, Format.SS]
            let maxWidth = 0;

            for (const format of allFormats) {
                if (this.formatFlags & format) {
                    maxWidth = Math.max(maxWidth, this.getWidthForFormat(format));
                }
            }

            maxWidth += (this.padding + this.borderWidth + frameWidth) << 1;

            let images = this.digits.concat([this.colon, this.period]);
            if (this.smallDigits) {
                images = images.concat(this.smallDigits);
            }

            let maxHeight = 0;
            for (const img of images) {
                maxHeight = Math.max(maxHeight, img.height);
            }

            maxHeight += (this.padding + this.borderWidth + frameWidth) << 1;

            this.setDimensions(
                maxWidth,
                maxHeight,
            );

            this.x = prevX;
            this.y = prevY;
        }

        protected getWidthForFormat(format: Format): number {
            const colonWidth = this.colonWidth || this.colon.width + 1;
            const periodWidth = this.periodWidth || this.period.width + 1;
            const digitWidth = this.digitWidth || this.digits[0].width + 1;
            const smallDigitWidth = this.smallDigitWidth || (this.smallDigits ? this.smallDigits[0].width + 1 : digitWidth);

            switch (format) {
                case Format.HH_MM_SS_MM:
                    return 6 * digitWidth + 2 * colonWidth + periodWidth + 2 * smallDigitWidth;
                case Format.HH_MM_SS:
                    return 6 * digitWidth + 2 * colonWidth;
                case Format.MM_SS_MM:
                    return 4 * digitWidth + colonWidth + periodWidth + 2 * smallDigitWidth;
                case Format.MM_SS:
                    return 4 * digitWidth + colonWidth;
                case Format.SS_MM:
                    return 2 * digitWidth + periodWidth + 2 * smallDigitWidth;
                case Format.SS:
                    return 2 * digitWidth;
            }

            return 0;
        }
    }

    export function drawFrame(target: Image, frame: Image, left: number, top: number, width: number, height: number) {
        const frameUnit = Math.idiv(frame.width, 3);

        for (let x = frameUnit; x < width - (frameUnit << 1); x += frameUnit) {
            // top side
            target.blit(
                left + x,
                top,
                frameUnit,
                frameUnit,
                frame,
                frameUnit,
                0,
                frameUnit,
                frameUnit,
                true,
                false
            );

            // bottom side
            target.blit(
                left + x,
                top + height - frameUnit,
                frameUnit,
                frameUnit,
                frame,
                frameUnit,
                frameUnit << 1,
                frameUnit,
                frameUnit,
                true,
                false
            );
        }

        const modW = (width % frameUnit) || frameUnit

        // top side end
        target.blit(
            left + width - frameUnit - modW,
            top,
            modW,
            frameUnit,
            frame,
            frameUnit,
            0,
            modW,
            frameUnit,
            true,
            false
        );

        // bottom side end
        target.blit(
            left + width - frameUnit - modW,
            top + height - frameUnit,
            modW,
            frameUnit,
            frame,
            frameUnit,
            frameUnit << 1,
            modW,
            frameUnit,
            true,
            false
        );

        for (let y = frameUnit; y < height - (frameUnit << 1); y += frameUnit) {
            // left side
            target.blit(
                left,
                top + y,
                frameUnit,
                frameUnit,
                frame,
                0,
                frameUnit,
                frameUnit,
                frameUnit,
                true,
                false
            );

            // right side
            target.blit(
                left + width - frameUnit,
                top + y,
                frameUnit,
                frameUnit,
                frame,
                frameUnit << 1,
                frameUnit,
                frameUnit,
                frameUnit,
                true,
                false
            );
        }

        const modH = (height % frameUnit) || frameUnit;

        // left side end
        target.blit(
            left,
            top + height - frameUnit - modH,
            frameUnit,
            modH,
            frame,
            0,
            frameUnit,
            frameUnit,
            modH,
            true,
            false
        );

        // right side end
        target.blit(
            left + width - frameUnit,
            top + height - frameUnit - modH,
            frameUnit,
            modH,
            frame,
            frameUnit << 1,
            frameUnit,
            frameUnit,
            modH,
            true,
            false
        );

        // top left corner
        target.blit(
            left,
            top,
            frameUnit,
            frameUnit,
            frame,
            0,
            0,
            frameUnit,
            frameUnit,
            true,
            false
        );

        // top right corner
        target.blit(
            left + width - frameUnit,
            top,
            frameUnit,
            frameUnit,
            frame,
            frameUnit << 1,
            0,
            frameUnit,
            frameUnit,
            true,
            false
        );

        // bottom left corner
        target.blit(
            left,
            top + height - frameUnit,
            frameUnit,
            frameUnit,
            frame,
            0,
            frameUnit << 1,
            frameUnit,
            frameUnit,
            true,
            false
        );

        // bottom right corner
        target.blit(
            left + width - frameUnit,
            top + height - frameUnit,
            frameUnit,
            frameUnit,
            frame,
            frameUnit << 1,
            frameUnit << 1,
            frameUnit,
            frameUnit,
            true,
            false
        );

        // middle
        const bodyColor = frame.getPixel(frameUnit, frameUnit);
        if (bodyColor) {
            target.fillRect(
                left + frameUnit,
                top + frameUnit,
                width - (frameUnit << 1),
                height - (frameUnit << 1),
                bodyColor
            );
        }
    }
}