
# Cristian Camilo Cardona
# Johan Sebastian Diaz


### Signer and signature verifier

The program should have three options:  

1) **RSA key pair generation** : It must generate the public and private key in two separate files. The private key file must be protected with a password.  

2) **Sign file**: This option receives as input any file, and the private key file. Once the password for unlocking the private key is verified, the program must generate the digital signature of the file, and save it in a separate file.  

3) **Signature verification**: This option must receive as input the original file, the file containing the signature, and the public key file. With these three inputs, it must be verified that the signature is correct.