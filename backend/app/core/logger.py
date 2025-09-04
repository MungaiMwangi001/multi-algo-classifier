import logging
import sys
from loguru import logger

class InterceptHandler(logging.Handler):
    def emit(self, record):
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = record.levelno

        frame, depth = sys._getframe(6), 6
        while frame and frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back
            depth += 1

        logger.opt(depth=depth, exception=record.exc_info).log(
            level, record.getMessage()
        )

def setup_logging():
    # Intercept standard logging
    logging.basicConfig(handlers=[InterceptHandler()], level=0, force=True)

    # Configure loguru
    logger.configure(
        handlers=[
            {
                "sink": sys.stdout,
                "format": "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> "
                          "| <level>{level: <8}</level> "
                          "| <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> "
                          "- <level>{message}</level>"
            },
            {
                "sink": "logs/app.log",
                "rotation": "500 MB",
                "format": "{time:YYYY-MM-DD HH:mm:ss.SSS} | {level: <8} | {name}:{function}:{line} - {message}"
            }
        ]
    )

    # Disable uvicorn access logger (so it doesn’t double log requests)
    logging.getLogger("uvicorn.access").handlers = [InterceptHandler()]

    return logger
