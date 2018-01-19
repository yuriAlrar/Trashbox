# coding:utf-8
import socket
import cgi,os,sys,io
import os.path
import string
import datetime
import locale
import hashlib
import urllib
import urllib.parse
import urllib.request
import datetime
import codecs
import http
import shutil
import struct
import mimetypes
import datetime
import binascii
import pickle
sys.path.append('/var/www/trashbox/source/src')
import extlib
import handler

def application(environ, start_response):
	flag = False
	ExtLib = extlib.extlib()
	Rqs = handler.handler(environ)
	Rqs.status = '404 Not Found'
	Rqs.response = [('Content-type', 'text/html')]

	method = environ.get('REQUEST_METHOD')
	if method != "POST":
		start_response( Rqs.status , Rqs.response )
		return[str(flag).encode()]
	wsgi_input = environ['wsgi.input']
	form = cgi.FieldStorage(fp=wsgi_input,environ=environ,keep_blank_values=True)
	pst_key = form.keys()
#認証
	if "@auth" in form and "@type" in form and Rqs.acsAuth( form["@auth"].value ):
		filename = ExtLib.strapp( form["@name"].value )
		mode = "w" if isinstance( form["@bin"].value , str ) else "wb"
		fil = open( "/var/www/trashbox/archive/" + filename , mode)
		fil.write( form["@bin"].value )
		fil.close()
		flag = True
		start_response('200 OK', [('Content-type', 'text/html')])
		return[ str(flag).encode() ]
	else:
		start_response( Rqs.status , Rqs.response )
		return[str(flag).encode()]
