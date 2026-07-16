
# Install LibreOffice

This is a step-by-step guide to install LibreOffice, required by carbone to generate reports.

Guide taken from [carbone documentation](https://github.com/carboneio/carbone?tab=readme-ov-file#1---install-libreoffice)

```sh
#  Remove previous LibreOffice installation
sudo apt remove --purge libreoffice*
sudo apt autoremove --purge

# Download LibreOffice debian package. Select the right one (64-bit or 32-bit) for your OS.
# Get the latest from http://download.documentfoundation.org/libreoffice/stable
# or download the version currently "carbone-tested":
wget https://downloadarchive.documentfoundation.org/libreoffice/old/7.5.1.1/deb/x86_64/LibreOffice_7.5.1.1_Linux_x86-64_deb.tar.gz

# Install required dependencies on ubuntu server for LibreOffice 7.0+
sudo apt install libxinerama1 libfontconfig1 libdbus-glib-1-2 libcairo2 libcups2 libglu1-mesa libsm6

# Uncompress package
tar -zxvf LibreOffice_7.5.1.1_Linux_x86-64_deb.tar.gz
cd LibreOffice_7.5.1.1_Linux_x86-64_deb/DEBS

# Install LibreOffice
sudo dpkg -i *.deb
```

## Additional steps (optional)

```sh
# If you want to use Microsoft fonts in reports, you must install the fonts
# Andale Mono, Arial Black, Arial, Comic Sans MS, Courier New, Georgia, Impact,
# Times New Roman, Trebuchet, Verdana,Webdings)
sudo apt install ttf-mscorefonts-installer

# If you want to use special characters, such as chinese ideograms, you must install a font that support them
# For example:
sudo apt install fonts-wqy-zenhei
```

## Troubleshooting

To check if LibreOffice is installed correctly, run:

```sh
/opt/libreoffice7.5/program/soffice --version
```

If you get an error like:

> `/opt/libreoffice7.5/program/soffice.bin: error while loading shared libraries: libssl3.so: cannot open shared object file: No such file or directory`

You need to install the `libnss3` package, which in Debian 5 is not installed by default.

```sh
sudo apt update
sudo apt-get install libnss3
```
