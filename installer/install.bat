@echo off
setlocal

:: �C���X�g�[���[�̃f�B���N�g���p�X���擾
set "INSTALLER_DIR=%~dp0"

:: ���[�g�f�B���N�g����ݒ� (SillyTavern�̃��[�g)
set "ROOT_DIR=%INSTALLER_DIR%..\"

:: �Ǘ��Ҍ����`�F�b�N
net session >nul 2>&1
if %errorlevel% neq 0 (
   echo �Ǘ��Ҍ������K�v�ł��B�E�N���b�N���u�Ǘ��҂Ƃ��Ď��s�v���Ă��������B
   pause
   exit /b 1
)

:: �K�v�ȃf�B���N�g���ƃt�@�C���̑��݊m�F
if not exist "%ROOT_DIR%public\scripts\extensions" (
   echo public/scripts/extensions �f�B���N�g����������܂���
   echo �C���X�g�[���[�� SillyTavern/installer/ �ɔz�u���Ă��������B
   pause
   exit /b 1
)
if not exist "%INSTALLER_DIR%install_core.ps1" (
   echo �K�v�ȃt�@�C�� install_core.ps1 ��������܂���B
   echo �o�b�`�t�@�C���Ɠ����ꏊ�ɔz�u���Ă��������B
   pause
   exit /b 1
)

:: �g���@�\�̃R�s�[�i�����㏑���j
echo �g���@�\���R�s�[���Ă��܂�...
robocopy "%INSTALLER_DIR%extensions" "%ROOT_DIR%public\scripts\extensions" /E /IS /IT /NFL /NDL /NJH /NJS /nc /ns /np >nul

:: default.png�̃R�s�[����
if not exist "%ROOT_DIR%public\addchara\" (
   mkdir "%ROOT_DIR%public\addchara\"
   echo addchara�f�B���N�g�����쐬���܂���
)
if not exist "%ROOT_DIR%public\addchara\default.png" (
   copy "%INSTALLER_DIR%default.png" "%ROOT_DIR%public\addchara\" >nul
   echo default.png���R�s�[���܂���
)

:: index.html�̕ҏW
echo index.html��ҏW���Ă��܂�...
set "index_file=%ROOT_DIR%public\index.html"

if not exist "%index_file%" (
   echo index.html��������܂���: %index_file%
   pause
   exit /b 1
)

:: �o�b�N�A�b�v���쐬
copy /y "%index_file%" "%index_file%.bak" >nul
echo index.html�̃o�b�N�A�b�v���쐬���܂���: %index_file%.bak

:: ================================================================
:: PowerShell�X�N���v�g���Ăяo���āA���S�Ƀt�@�C���ҏW���s��
:: ================================================================
powershell -NoProfile -ExecutionPolicy Bypass -File "%INSTALLER_DIR%install_core.ps1" -filePath "%index_file%"

if %errorlevel% neq 0 (
    echo.
    echo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    echo !!  index.html �̕ҏW�Ɏ��s���܂����B            !!
    echo !!  SillyTavern�̃o�[�W�������Ή����Ă��Ȃ����A   !!
    echo !!  �t�@�C�����ύX����Ă���\��������܂��B     !!
    echo !!  �o�b�N�A�b�v����t�@�C���𕜌����Ă��������B     !!
    echo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    echo �o�b�N�A�b�v�t�@�C��: %index_file%.bak
) else (
    echo.
    echo �C���X�g�[��������Ɋ������܂����B
)

echo.
pause
